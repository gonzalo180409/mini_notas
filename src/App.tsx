import { useEffect} from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';


function App() {
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const idToken = tokens?.idToken?.toString();
        const restOperation = get({
          apiName: 'myRestApi',
          path: '/notas',
          options: {
            headers: {
              Authorization: idToken!,
            },
          },
        });
        const response = await restOperation.response;
        const data = await response.body.json();
        console.log("Notas desde API:", data);
      } catch (error: any) {
        console.error("Error al obtener notas:", await error.response.body.text());
      }
    };
    fetchNotas();
  }, []);

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s notas</h1>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
