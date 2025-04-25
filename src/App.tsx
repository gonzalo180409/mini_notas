import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { get, post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

function App() {
  const { user, signOut } = useAuthenticator();
  const [notas, setNotas] = useState<any[]>([]);

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
      setNotas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error al obtener notas:", await error.response.body.text());
    }
  };

  const createNota = async () => {
    const content = window.prompt("Escribe tu nota:");
    if (!content) return;

    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();

      const restOp = post({
        apiName: 'myRestApi',
        path: '/notas',
        options: {
          headers: {
            Authorization: idToken!,
            'Content-Type': 'application/json',
          },
          body: { content },
        },
      });

      const response = await restOp.response;
      const nuevaNota = await response.body.json();
      setNotas((prev) => [...prev, nuevaNota]);
    } catch (error: any) {
      console.error("Error al crear nota:", await error.response.body.text());
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s notas</h1>
      <button onClick={createNota}>+ Nueva nota</button>
      <ul>
        {notas.map((nota) => (
          <li key={nota.id}>{nota.content}</li>
        ))}
      </ul>
      <button onClick={signOut}>Cerrar sesión</button>
    </main>
  );
}

export default App;
