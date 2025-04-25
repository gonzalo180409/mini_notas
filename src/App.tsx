import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { get } from 'aws-amplify/api';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [setNotas] = useState<any>([]);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const restOp = get({
          apiName: 'myRestApi',
          path: '/notas',
          options: {
            retryStrategy: { strategy: 'no-retry' },
          },
        });
        const response = await restOp.response;
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
