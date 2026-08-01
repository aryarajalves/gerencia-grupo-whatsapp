---
trigger: always_on
---

# Regra de Gerenciamento de Estado Global (Frontend)

O estado global do frontend deve ser organizado de forma escalável para evitar prop drilling excessivo conforme o projeto cresce.

**Critério para uso de Context API:**
- Se um dado precisa ser acessado por **3 ou mais componentes** em diferentes níveis da árvore, ele deve sair do `App.jsx` e ir para um Context dedicado.
- Props passadas por mais de **2 níveis intermediários** que não usam aquele dado são um sinal claro de que Context é necessário.

**Contextos recomendados para este projeto:**
- `AuthContext` — `isLoggedIn`, `userRole`, `userName`
- `WaStatusContext` — `waStatus` (status + plan_type do WhatsApp)
- `CompanyContext` — `companyInfo`

**Como criar um Context neste projeto:**
1. Crie o arquivo em `frontend/src/contexts/NomeContext.jsx`
2. Exporte o Provider e um hook customizado `useNome()` no mesmo arquivo
3. Envolva os componentes necessários com o Provider em `App.jsx`

**Exemplo de estrutura:**
```jsx
// frontend/src/contexts/WaStatusContext.jsx
const WaStatusContext = createContext(null);

export const WaStatusProvider = ({ children }) => {
  const [waStatus, setWaStatus] = useState({ status: 'desconhecido', plan_type: 'LITE' });
  // lógica de fetch aqui
  return <WaStatusContext.Provider value={{ waStatus }}>{children}</WaStatusContext.Provider>;
};

export const useWaStatus = () => useContext(WaStatusContext);
```

**O que NÃO fazer:**
- Não usar Redux ou Zustand — o projeto não tem complexidade que justifique.
- Não criar um único "GlobalContext" com tudo dentro — separe por domínio.
- Não mover estado local (usado por apenas 1 componente) para Context.

**Estado atual:** O `App.jsx` ainda centraliza o estado. Ao criar novas funcionalidades que precisem de dados globais, use Context em vez de passar mais props.
