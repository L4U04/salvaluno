'use client';
import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false); // 1. Adiciona o estado 'isMounted'

  // 2. Este useEffect SÓ roda no cliente, após a montagem
  useEffect(() => {
    setIsMounted(true); // 3. Define como montado

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Se NÃO estiver montado (no servidor ou 1º render), mostre um placeholder
  if (!isMounted) {
    return <div className="w-20 h-5" />; // Retorna um placeholder com tamanho
    // ou "00:00:00", ou null. O importante é ser igual no servidor e 1º render.
  }

  // 5. Agora que está montado, pode mostrar a hora real.
  return <div>{time.toLocaleTimeString()}</div>;
}