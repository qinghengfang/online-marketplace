import { useEffect } from 'react';
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate } from '@azure/msal-react';
import { InteractionStatus, SilentRequest, BrowserUtils } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest, b2cPolicies } from '../../authConfig';
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectAccessToken, selectClaims, setAccessToken, setClaims } from './userSlice'
import MsalProp from "../../dataModels/MsalProp"
import "./User.css"
import { Link } from 'react-router-dom';
import { SeverityLevel } from '@microsoft/applicationinsights-web';
import { appInsights} from '../../ApplicationInsightsService';

function LoginComponent () {
  const { instance, inProgress } = useMsal();
  const claims = useAppSelector(selectClaims);
  const accessToken = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch()

    useEffect(() => {
      const activeAccount = instance.getActiveAccount();
      if (activeAccount) {
        dispatch(setClaims(activeAccount?.idTokenClaims));
        if (accessToken == null)
        {
          const accessTokenRequest: SilentRequest = {
            scopes: loginRequest.scopes,
            account: activeAccount || undefined,
          };
          
          instance.initialize().then(() => {
            instance.acquireTokenSilent(accessTokenRequest)
              .then((result) => {
                // Acquire token silent success
                dispatch(setAccessToken(result.accessToken));
                appInsights.trackTrace({ message: 'Acquire access token silent succeed.', severityLevel: SeverityLevel.Information });
              });
          });
        }
      }
    }, [accessToken, dispatch, instance]);

  const handleLoginRedirect = () => {
    instance
        .loginPopup({
            ...loginRequest,
        })
        .then(result => {
          appInsights.trackTrace({ message: 'User logged in.', severityLevel: SeverityLevel.Information });
          dispatch(setAccessToken(result.accessToken));
          dispatch(setClaims(result.idTokenClaims));
        })
        .catch(e => {
            console.error(e);
        });
  };

  const handleLogoutRedirect = () => {
    instance
        .logoutRedirect({
          account: instance.getActiveAccount(),
          onRedirectNavigate: () => !BrowserUtils.isInIframe()
        })
        .catch(e => {
          console.error(e);
        });
  };

    const handleProfileEdit = () => {
        if(inProgress === InteractionStatus.None){
            // @ts-expect-error need to pass authority for acquireTokenRedirect to support B2C profile edit
            instance.acquireTokenRedirect(b2cPolicies.authorities.editProfile);
        }
    };

  return (
    <>
      <AuthenticatedTemplate>
      <div className="dropdown">
        <button className="dropbtn">{claims?.name}</button>
        <div className="dropdown-content">
          <Link to="/inventory">Inventory</Link>
          <a href="" onClick={handleProfileEdit}>Edit Profile</a>
          <a href="" onClick={handleLogoutRedirect}>Sign Out</a>
        </div>
      </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <li>
          <button  
            onClick={handleLoginRedirect}> 
              Sign In 
          </button>
        </li>
      </UnauthenticatedTemplate>
    </>
  )
}

function User(props: MsalProp) {
  return (
    <MsalProvider instance={props.msalInstance}>
      <LoginComponent />
    </MsalProvider>
  )
}

export default User
