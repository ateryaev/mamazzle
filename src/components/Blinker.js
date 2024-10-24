import { useEffect, useState } from "react";

export function Blinker({ children, period, times, ...props }) {
  const [counter, setCounter] = useState(0);
  if (!period) period = 500;
  useEffect(() => {
    const tmo = setTimeout(() => {
      if (times && counter >= times) return;
      setCounter(counter + 1);
    }, period);
    return () => clearTimeout(tmo);
  }, [counter]);

  return (
    <span {...props} style={{ visibility: counter % 2 === 1 ? "hidden" : "visible" }}>
      {children}
    </span>
  )
}