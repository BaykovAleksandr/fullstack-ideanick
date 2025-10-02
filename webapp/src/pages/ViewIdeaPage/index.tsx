import { useParams } from 'react-router-dom';

export const ViewIdeaPage = () => {
  const { ideaNick } = useParams() as { ideaNick: string };
  return (
    <div>
      <h1>{ideaNick}</h1>
      <p>Description of idea 1...</p>
      <div>
        <p>Text paragraph 1...</p>
        <p>Text paragraph 2...</p>
        <p>Text paragraph 3...</p>
      </div>
    </div>
  );
};
