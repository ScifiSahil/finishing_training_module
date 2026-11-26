// Renders a list of lesson blocks. Each block is { t: "<type>", ...fields } from courseData.json.
import { ParagraphBlock, HeadingBlock, ListBlock, CalloutBlock, TableBlock, ChainBlock, ImageBlock, GalleryBlock, SplitBlock, AccordionBlock, CardsBlock } from "./BasicBlocks";
import { DoDontBlock, TabsBlock, StepsBlock, ChecklistBlock, CheckRulesBlock, PpeCheckBlock } from "./InteractiveBlocks";
import { ProductsBlock, ProcessMapBlock } from "./ProductBlocks";
import { SelectorBlock, LoadSelectBlock, ToteSelectBlock, IdPartBlock, DefectBlock, DeciderBlock } from "./WidgetBlocks";
import { FurnaceBlock, TpmBlock, SpotBlock } from "./ChartBlocks";
import { VideoPlayer } from "../VideoPlayer";

// A function (not a lookup object) so blocks that contain blocks can import this file safely
function renderBlock(b) {
  switch (b.t) {
    case "p": return <ParagraphBlock block={b} />;
    case "h": return <HeadingBlock block={b} />;
    case "list": return <ListBlock block={b} />;
    case "callout": return <CalloutBlock block={b} />;
    case "table": return <TableBlock block={b} />;
    case "chain": return <ChainBlock block={b} />;
    case "img": return <ImageBlock block={b} />;
    case "gallery": return <GalleryBlock block={b} />;
    case "split": return <SplitBlock block={b} />;
    case "accordion": return <AccordionBlock block={b} />;
    case "cards": return <CardsBlock block={b} />;
    case "dd": return <DoDontBlock block={b} />;
    case "tabs": return <TabsBlock block={b} />;
    case "steps": return <StepsBlock block={b} />;
    case "checklist": return <ChecklistBlock block={b} />;
    case "checkrules": return <CheckRulesBlock block={b} />;
    case "ppecheck": return <PpeCheckBlock />;
    case "products": return <ProductsBlock />;
    case "processmap": return <ProcessMapBlock />;
    case "selector": return <SelectorBlock block={b} />;
    case "loadsel": return <LoadSelectBlock />;
    case "toteselect": return <ToteSelectBlock />;
    case "idpart": return <IdPartBlock />;
    case "defect": return <DefectBlock block={b} />;
    case "tpm": return <TpmBlock />;
    case "spot": return <SpotBlock />;
    case "decider": return <DeciderBlock />;
    case "furnace": return <FurnaceBlock />;
    case "vsop": return <VideoPlayer sopId={b.sop} />;
    default: return null;
  }
}

export function BlockList({ blocks }) {
  return blocks.map((b, i) => {
    const node = renderBlock(b);
    return node ? (
      <div key={i} className="mb-5 last:mb-0">
        {node}
      </div>
    ) : null;
  });
}
