---
trigger: always_on
---

# Regra de Verificação de Plano W-API (LITE vs PRO)

Antes de implementar qualquer requisição a um endpoint da W-API, é obrigatório verificar a compatibilidade com o plano do usuário.

**Protocolo Obrigatório:**

1. **Consulte a documentação:** Acesse https://docs.w-api.app e verifique se o endpoint desejado está disponível no plano LITE ou apenas no PRO.

2. **Checagem no Backend:** Se o endpoint for exclusivo PRO, adicione a verificação no router correspondente antes de executar a requisição:
```python
plan_config = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
plan_type = plan_config.valor if plan_config else "LITE"

if plan_type == "LITE":
    raise HTTPException(
        status_code=403,
        detail="PRO_REQUIRED::<descrição clara do recurso que exige PRO>"
    )
```
   - Use o prefixo `PRO_REQUIRED::` no `detail` para que o frontend identifique e exiba o toast correto.

3. **Checagem no Frontend:** Ao capturar um erro `403` com `detail` começando com `PRO_REQUIRED::`, use a função `toastPlanoInsuficiente` para exibir o toast estilizado:
```javascript
import { toastPlanoInsuficiente } from '../../../utils/toastPlano';

} catch (error) {
  const detail = error.response?.data?.detail || '';
  if (error.response?.status === 403 && detail.startsWith('PRO_REQUIRED::')) {
    toastPlanoInsuficiente(detail.replace('PRO_REQUIRED::', ''));
  } else {
    toast.error(detail || 'Erro ao executar ação');
  }
}
```

4. **Toast de Plano Insuficiente:** A função `toastPlanoInsuficiente` está em `frontend/src/utils/toastPlano.js` e exibe um toast customizado com ícone de cadeado, cor âmbar/dourada e mensagem clara explicando que o recurso é exclusivo PRO.

5. **Nunca bloquear silenciosamente:** O usuário deve sempre ser informado do motivo pelo qual a ação não pôde ser realizada.

**Exemplo de endpoints PRO conhecidos:**
- Revogar/apagar mensagem para todos (`/captura/revogar/:id`) — já implementado.

**Como o plano é detectado:**
- O `sync_service.py` detecta o plano via `instance/list-instances` e salva em `WHATSAPP_PLAN_TYPE` no banco.
- O frontend consulta `/whatsapp/status` a cada 60 segundos e mantém `waStatus.plan_type` atualizado.
