import httpx
import os
import models
from database import SessionLocal

def force_sync_links():
    db = SessionLocal()
    try:
        def get_config(chave):
            c = db.query(models.Configuracao).filter(models.Configuracao.chave == chave).first()
            return c.valor if c and c.valor else os.getenv(chave)

        token = get_config("WAPI_TOKEN")
        instance_id = get_config("WAPI_INSTANCE_ID")
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        grupos = db.query(models.GrupoWhatsApp).all()
        print(f"Sincronizando {len(grupos)} grupos...")
        
        for g in grupos:
            print(f"--- Grupo: {g.nome} ({g.id_do_grupo}) ---")
            
            # Tentativas de endpoints variados
            jid = g.id_do_grupo
            jid_clean = jid.split('@')[0]
            
            endpoints = [
                ("GET", f"https://api.w-api.app/v1/group/get-group-info?instanceId={instance_id}&groupId={jid}"),
                ("POST", f"https://api.w-api.app/v1/group/get-invite-code?instanceId={instance_id}&groupId={jid}"),
                ("POST", f"https://api.w-api.app/v1/group/invite-code?instanceId={instance_id}&groupId={jid}"),
                ("GET", f"https://api.w-api.app/v1/group/get-invite-code?instanceId={instance_id}&groupId={jid}"),
                ("GET", f"https://api.w-api.app/v1/instances/{instance_id}/group/invite-code?groupId={jid}")
            ]
            
            success = False
            for method, url in endpoints:
                try:
                    if method == "GET":
                        resp = httpx.get(url, headers=headers, timeout=10)
                    else:
                        resp = httpx.post(url, headers=headers, json={"groupId": jid}, timeout=10)
                        
                    if resp.status_code == 200:
                        data = resp.json()
                        print(f"  [DEBUG] Sucesso em {url}: {data}")
                        code = data.get("inviteCode") or data.get("inviteUrl") or data.get("code")
                        if not code and "group" in data:
                            code = data["group"].get("inviteCode") or data["group"].get("inviteUrl")
                        
                        if code:
                            link = code if code.startswith("http") else f"https://chat.whatsapp.com/{code}"
                            g.link_convite = link
                            print(f"  [OK] Link capturado: {link}")
                            success = True
                            break
                    else:
                        print(f"  [Falha] {method} {url} -> {resp.status_code}")
                except Exception as e:
                    print(f"  [Erro] {url} -> {str(e)}")
            
            if not success:
                print(f"  [AVISO] Não foi possível obter o link para {g.nome}")

        db.commit()
        print("\nSincronização concluída.")

    finally:
        db.close()

if __name__ == "__main__":
    force_sync_links()
