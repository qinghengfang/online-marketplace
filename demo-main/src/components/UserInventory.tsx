import { useAppSelector } from '../app/hooks'
import { selectAccessToken, selectClaims } from '../features/user/userSlice'

function UserInventory() {

  const claims = useAppSelector(selectClaims);
  const accessToken = useAppSelector(selectAccessToken);

  return (
    <>
      <p>Claims: {JSON.stringify(claims)}</p>
      <p>Access Token: {accessToken}</p>
    </>
  )
}

export default UserInventory
