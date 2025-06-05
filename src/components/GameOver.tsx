import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

export interface Props {
  score: number;
  onRestart: () => void;
}

export const GameOver: React.FC<Props> = ({ score, onRestart }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [blob, setBlob] = useState<Blob>();

  useEffect(() => {
    html2canvas(document.querySelector('.wrapper') as HTMLElement).then(setCanvas);
  }, []);

  useEffect(() => {
    canvas?.toBlob((b) => setBlob(b as Blob), 'image/jpeg');
  }, [canvas]);

  return (
    <div className="game-over">
      <h1>Game Over</h1>
      <p className="score">SCORE: {score}</p>
      <div className="buttons">
        <button className="restart button" onClick={onRestart}>
          Try Again
        </button>
      </div>
    </div>
  );
};
