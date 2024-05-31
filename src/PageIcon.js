import { Window } from "./components/Window";
function Char({ char, ...props }) {
  return (
    <div {...props} className="w-[80px] aspect-square xborder-[10px] xborder-white
    font-bold rounded-[8px] box-border bg-white
    text-[50px] text-accent flex justify-center items-center">
      {char}
    </div>
  )
}
export function PageIcon({ }) {
  const r = "32px";
  const p = "4px";
  return (
    <Window title={<>icon</>}>

      <div className="w-[256px] aspect-square bg-accent mx-auto my-[50px]
      flex justify-center items-center">

        <div className="grid grid-cols-2 gap-[8px]">
          <Char char="M" style={{ borderTopLeftRadius: r, paddingTop: p, paddingLeft: p }} />
          <Char char="A" style={{ borderTopRightRadius: r, paddingTop: p, paddingRight: p }} />
          <Char char="A" style={{ borderBottomLeftRadius: r, paddingBottom: p, paddingLeft: p }} />
          <Char char="M" style={{ borderBottomRightRadius: r, paddingBottom: p, paddingRight: p }} />
        </div>
      </div>

    </Window>
  );
}