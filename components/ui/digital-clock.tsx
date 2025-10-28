'use client';

import { useEffect, useState } from 'react';

export default function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-center rounded-lg px-4 py-2">
      <p className="font-mono text-base font-semibold tracking-wider text-foreground">
        {formattedTime}
      </p>
    </div>
  );
}
