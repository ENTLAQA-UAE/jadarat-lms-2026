import { BlockType, type Block, type AccordionBlock, type TabsBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';

type ConvertiblePair = 'accordion' | 'tabs';

export const CONVERTIBLE_TYPES: Record<string, ConvertiblePair[]> = {
  [BlockType.ACCORDION]: ['tabs'],
  [BlockType.TABS]: ['accordion'],
};

export function canConvert(fromType: BlockType): BlockType[] {
  const targets = CONVERTIBLE_TYPES[fromType];
  if (!targets) return [];
  return targets.map((t) => {
    switch (t) {
      case 'accordion': return BlockType.ACCORDION;
      case 'tabs': return BlockType.TABS;
    }
  });
}

export function convertBlock(block: Block, toType: BlockType): Block {
  const baseFields = {
    id: block.id,
    order: block.order,
    visible: block.visible,
    locked: block.locked,
    style: block.style,
  };

  // Accordion → Tabs
  if (block.type === BlockType.ACCORDION && toType === BlockType.TABS) {
    const accordion = block as AccordionBlock;
    return {
      ...baseFields,
      type: BlockType.TABS,
      data: {
        tabs: accordion.data.items.map((item) => ({
          id: item.id,
          label: item.title,
          content: item.content,
          icon: item.icon,
        })),
        style: 'horizontal' as const,
      },
    } as TabsBlock;
  }

  // Tabs → Accordion
  if (block.type === BlockType.TABS && toType === BlockType.ACCORDION) {
    const tabs = block as TabsBlock;
    return {
      ...baseFields,
      type: BlockType.ACCORDION,
      data: {
        items: tabs.data.tabs.map((tab) => ({
          id: tab.id,
          title: tab.label,
          content: tab.content,
          icon: tab.icon,
        })),
        allow_multiple_open: false,
        start_expanded: false,
      },
    } as AccordionBlock;
  }

  // No conversion available — return original
  return block;
}
