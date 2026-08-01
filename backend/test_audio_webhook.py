import httpx
import asyncio
import time

async def test_audio_webhook():
    payload = {
        "event": "webhookReceived",
        "instanceId": "LITE-M3SOUT-6W04I8",
        "isGroup": True,
        "messageId": "TEST-AUDIO-" + str(time.time()),
        "chat": {"id": "120363423759307041@g.us"},
        "sender": {"id": "558596123586", "pushName": "Aryaraj Audio Test"},
        "msgContent": {
            "audioMessage": {
                "url": "https://mmg.whatsapp.net/v/t62.7114-24/...",
                "mimetype": "audio/ogg; codecs=opus",
                "mediaKey": "...",
                "directPath": "..."
            }
        },
        "moment": 1778096049
    }

    url = "http://localhost:8000/webhook/whatsapp"
    async with httpx.AsyncClient() as client:
        print(f"Enviando webhook de áudio para {url}...")
        # Note: This will probably fail to persist the actual file because the mediaKey is fake, 
        # but we want to check if it saves the TEXT correctly in the DB.
        resp = await client.post(url, json=payload)
        print(f"Status: {resp.status_code}, Body: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_audio_webhook())
