import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from './components/Nav.tsx'
import './index.css'

import { PublicClientApplication, EventMessage, AuthenticationResult, EventType } from '@azure/msal-browser';
import { msalConfig } from './authConfig'; 

import { store } from './app/store'
import { Provider } from 'react-redux'
import ProductTable from './components/ProductTable.tsx'
import NoMatch from './components/NoMatch.tsx';
import UserInventory from './features/userInventory/UserInventory.tsx';
import { injectStore } from './api/ApiClient.ts'
import { reactPlugin } from './ApplicationInsightsService';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';

export const msalInstance = new PublicClientApplication(msalConfig);

injectStore(store)

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if ((event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
          event.eventType === EventType.SSO_SILENT_SUCCESS) && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance.setActiveAccount(account);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppInsightsContext.Provider value={reactPlugin}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Nav msalInstance={msalInstance} />}>
              <Route index element={<ProductTable />} />
              <Route path="inventory" element={<UserInventory />} />
              {/* Using path="*"" means "match anything", so this route
                    acts like a catch-all for URLs that we don't have explicit
                    routes for. */}
              <Route path="*" element={<NoMatch />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </AppInsightsContext.Provider>
  </React.StrictMode>,
)
