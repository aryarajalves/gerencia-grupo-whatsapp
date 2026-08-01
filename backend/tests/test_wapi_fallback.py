import pytest
import respx
import httpx
import sys
import os

# Adiciona o diretório atual ao path para importar scheduler
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.sync_service import fetch_participants

@respx.mock
def test_fetch_participants_success_first_try():
    wapi_base = "https://api.w-api.app/v1"
    instance_id = "inst123"
    group_id = "grp123@g.us"
    headers = {"Authorization": "Bearer token"}
    
    # Mock first attempt
    route = respx.get(f"{wapi_base}/group/get-participants", params={"instanceId": instance_id, "groupId": group_id}).mock(
        return_value=httpx.Response(200, json={"participants": [{"id": "user1"}]})
    )
    
    with httpx.Client() as client:
        participants = fetch_participants(client, wapi_base, instance_id, group_id, headers)
    
    assert participants == [{"id": "user1"}]
    assert route.called

@respx.mock
def test_fetch_participants_fallback_group_jid():
    wapi_base = "https://api.w-api.app/v1"
    instance_id = "inst123"
    group_id = "grp123@g.us"
    headers = {"Authorization": "Bearer token"}
    
    # Mock first attempt (fail with 404)
    respx.get(f"{wapi_base}/group/get-participants", params={"instanceId": instance_id, "groupId": group_id}).mock(
        return_value=httpx.Response(404)
    )
    
    # Mock second attempt (success with groupJid)
    route = respx.get(f"{wapi_base}/group/get-participants", params={"instanceId": instance_id, "groupJid": group_id}).mock(
        return_value=httpx.Response(200, json={"participants": [{"id": "user2"}]})
    )
    
    with httpx.Client() as client:
        participants = fetch_participants(client, wapi_base, instance_id, group_id, headers)
    
    assert participants == [{"id": "user2"}]
    assert route.called

@respx.mock
def test_fetch_participants_fallback_post():
    wapi_base = "https://api.w-api.app/v1"
    instance_id = "inst123"
    group_id = "grp123@g.us"
    headers = {"Authorization": "Bearer token"}
    
    # Fail first two (GET attempts)
    respx.get(f"{wapi_base}/group/get-participants").mock(return_value=httpx.Response(404))
    
    # Mock POST attempt
    route = respx.post(f"{wapi_base}/group/get-participants").mock(
        return_value=httpx.Response(200, json={"participants": [{"id": "user3"}]})
    )
    
    with httpx.Client() as client:
        participants = fetch_participants(client, wapi_base, instance_id, group_id, headers)
    
    assert participants == [{"id": "user3"}]
    assert route.called

@respx.mock
def test_fetch_participants_fallback_group_info():
    wapi_base = "https://api.w-api.app/v1"
    instance_id = "inst123"
    group_id = "grp123@g.us"
    headers = {"Authorization": "Bearer token"}
    
    # Fail first three
    respx.get(f"{wapi_base}/group/get-participants").mock(return_value=httpx.Response(404))
    respx.post(f"{wapi_base}/group/get-participants").mock(return_value=httpx.Response(404))
    
    # Mock get-group-info
    route = respx.get(f"{wapi_base}/group/get-group-info", params={"instanceId": instance_id, "groupId": group_id}).mock(
        return_value=httpx.Response(200, json={"group": {"participants": [{"id": "user4"}]}})
    )
    
    with httpx.Client() as client:
        participants = fetch_participants(client, wapi_base, instance_id, group_id, headers)
    
    assert participants == [{"id": "user4"}]
    assert route.called
