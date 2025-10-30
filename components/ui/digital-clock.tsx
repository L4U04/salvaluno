'use client';
import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted) {
    return <div className="w-20 h-5" />; 
  }

  return <div>{time.toLocaleTimeString()}</div>;
}