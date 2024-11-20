import { useEffect, useMemo, useState } from "react";

export function Blinker({ children, period, times, ...props }) {
  const [counter, setCounter] = useState(0);
  const visibility = useMemo(() => {
    if (!times) return counter % 2 === 1;
    if (counter >= times) return true;
    return counter % 2 === 1
  }, [counter, times]);

  if (!period) period = 500;
  useEffect(() => {
    const tmo = setTimeout(() => {
      if (times && counter > times * 10) {
        setCounter(0);
        return;
      }
      setCounter(counter + 1);
    }, period);
    return () => clearTimeout(tmo);
  }, [counter, period, times]);

  return (
    <span {...props} style={{ visibility: visibility ? "visible" : "hidden" }}>
      {children}
    </span>
  )
}