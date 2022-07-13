import Markdown from 'markdown-to-jsx';
import model from '../../resources/model/model';
import { ChordBox } from '../chordBox';
import './lyrics.scss';

const replacers = [
  {
    reg: /\\h{(.*?)}/g,
    fun: str => `<span class="hskip" style="width:${str.substring(3, str.length - 1)}"> </span>`
  },
  {
    reg: /\\hskip{(.*?)}/g,
    fun: str => `<span class="hskip" style="width:${str.substring(3, str.length - 1)}"> </span>`
  },
  {
    reg: "|:",
    fun: x => "𝄆"
  },
  {
    reg: ":|",
    fun: x => "𝄇"
  },
  {
    reg: /\[(.*?)\]/g,
    fun: str => model.settings.displayChords?"<chord>" + str.substring(1, str.length - 1) + "</chord>":""
  }
]

export function Lyrics({ children = "", name = "" }) {
  let text = (typeof children === "string") ? children : ""
  if (typeof name !== "string") name = ""

  replacers.forEach(r => text = text.replaceAll(r.reg, r.fun))

  const rows = text.split("\n")

  return <div className="chord-lyrics">
    {rows.map(row => <div className={`lyrics-line ${row.includes("<chord>")?"has-chords":""}`}>
      <Markdown
        options={{
          overrides: {
            chord: {
              component: ChordBox,
            },
          }
        }}
      >{row}</Markdown>
    </div>)}
  </div>
}

