// Basic lesson blocks: paragraph, heading, list, callout, table, chain, picture, gallery,
// split layout, accordion and flip cards.
import { useState } from "react";
import { RichText, Inline, Callout } from "../Ui";
import { Figure, Icon } from "../Pictures";
import { getImage, parseInline } from "../../utils/trainingUtils";
import { BlockList } from "./BlockList";

export const ParagraphBlock = ({ block }) => <RichText text={block.text} />;

export const HeadingBlock = ({ block }) => (
  <h3 className="mb-2.5 text-[1.45rem]">{block.text}</h3>
);

export const ListBlock = ({ block }) => (
  <ul className="mb-[.8em] max-w-[68ch] list-disc pl-[1.3em]">
    {block.items.map((item, i) => (
      <li key={i} className="my-[.3em]">
        <Inline parts={parseInline(item)} />
      </li>
    ))}
  </ul>
);

export const CalloutBlock = ({ block }) => (
  <Callout kind={block.kind} title={block.title} text={block.text} />
);

export const TableBlock = ({ block }) => (
  <div className="overflow-x-auto rounded-lg border border-line">
    <table className="w-full border-collapse text-[.95rem] [&_tr:nth-child(even)_td]:bg-surface2">
      <thead>
        <tr>
          {block.cols.map((c) => (
            <th
              key={c}
              scope="col"
              className="sticky top-0 bg-rail px-3 py-2.5 text-left font-head text-[1.05rem] text-railInk"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className="border-t border-line px-3 py-2.5 align-top">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const LINK =
  "relative mr-[18px] block min-w-[140px] flex-[1_1_150px] px-[26px] py-3 text-white " +
  "[clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_50%,calc(100%_-_16px)_100%,0_100%,16px_50%)] " +
  "first:pl-3.5 first:[clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_50%,calc(100%_-_16px)_100%,0_100%)]";

export const ChainBlock = ({ block }) => (
  <div className="flex flex-wrap items-stretch">
    {block.items.map((item) => (
      <div key={item.b} className={`${LINK} ${block.red ? "bg-red" : "bg-black"}`}>
        <b className={`block font-head text-[1.3rem] ${block.red ? "text-white" : "text-yellow"}`}>
          {item.b}
        </b>
        <span className="block text-[.86rem] leading-[1.3] text-[#D4DAE0]">{item.s}</span>
      </div>
    ))}
  </div>
);

export const ImageBlock = ({ block }) => (
  <Figure k={block.k} cap={block.cap} small={block.small} />
);

// Full class names so Tailwind can see them
const GALLERY_COLS = {
  2: "grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]",
  3: "grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))]",
  4: "grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))]",
};

export const GalleryBlock = ({ block }) => (
  <div className={`grid items-start gap-3.5 ${GALLERY_COLS[block.cols || 3] || GALLERY_COLS[3]}`}>
    {block.items.map((item) => (
      <Figure key={item.k} k={item.k} cap={item.cap} />
    ))}
  </div>
);

export const SplitBlock = ({ block, reverse = false }) => (
  <div
    className={`grid grid-cols-1 items-start gap-[22px] desk:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${reverse ? "desk:!grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : ""}`}
  >
    <div>
      <BlockList blocks={block.left} />
    </div>
    <div>
      <BlockList blocks={block.right} />
    </div>
  </div>
);

export const AccordionBlock = ({ block }) => (
  <div className="overflow-hidden rounded-lg border border-line">
    {block.items.map((item, i) => (
      <details
        key={item.title}
        open={block.open === true ? i === 0 : block.open === i}
        className="group border-t border-line first:border-t-0"
      >
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-2.5 px-4 py-[13px] font-semibold before:w-5 before:font-head before:text-[1.5rem] before:content-['+'] group-open:bg-surface2 group-open:before:content-['–'] [&::-webkit-details-marker]:hidden">
          {item.title}
          {item.tag && (
            <span className="ml-auto inline-block rounded-full bg-redBg px-2 py-0.5 text-[.78rem] font-bold text-red">
              {item.tag}
            </span>
          )}
        </summary>
        <div className="px-4 pb-4 pl-[46px] pt-3">
          <RichText text={item.text} className="[&_p:last-child]:mb-0" />
          {item.k && <Figure k={item.k} small />}
        </div>
      </details>
    ))}
  </div>
);

const CARD_COLS = {
  3: "grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))]",
  4: "grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))]",
};

function RevealCard({ item, startOpen }) {
  const [open, setOpen] = useState(!!startOpen);
  const img = item.k && getImage(item.k);
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className="flex flex-col overflow-hidden rounded-lg border-2 border-line bg-surface p-0 text-left aria-expanded:border-black aria-expanded:shadow-[0_0_0_3px_var(--yellow)]"
    >
      {(img || item.icon) && (
        <div className="grid h-[150px] place-items-center bg-white">
          {img ? (
            <img src={img.src} alt="" width={img.w} height={img.h} loading="lazy" className="max-h-[140px] w-auto object-contain" />
          ) : (
            <Icon name={item.icon} />
          )}
        </div>
      )}
      <div className="p-3">
        <b className="block font-head text-[1.3rem]">{item.title}</b>
        {!open && <span className="text-[.82rem] text-muted">Select to reveal</span>}
        {open && <RichText text={item.text} className="mt-1.5 [&_p:last-child]:mb-0" />}
      </div>
    </button>
  );
}

export const CardsBlock = ({ block }) => (
  <div className={`grid gap-3.5 ${CARD_COLS[block.cols || 3] || CARD_COLS[3]}`}>
    {block.items.map((item) => (
      <RevealCard key={item.title} item={item} startOpen={block.open} />
    ))}
  </div>
);
