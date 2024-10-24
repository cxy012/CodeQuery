import { BlockquoteElement } from "@/components/plate-ui/blockquote-element"
import { CodeBlockElement } from "@/components/plate-ui/code-block-element"
import { CodeLeaf } from "@/components/plate-ui/code-leaf"
import { CodeLineElement } from "@/components/plate-ui/code-line-element"
import { CodeSyntaxLeaf } from "@/components/plate-ui/code-syntax-leaf"

import { HeadingElement } from "@/components/plate-ui/heading-element"
import { ImageElement } from "@/components/plate-ui/image-element"
import { LinkElement } from "@/components/plate-ui/link-element"
import { LinkFloatingToolbar } from "@/components/plate-ui/link-floating-toolbar"
import { ListElement } from "@/components/plate-ui/list-element"
import { MediaEmbedElement } from "@/components/plate-ui/media-embed-element"
import { ParagraphElement } from "@/components/plate-ui/paragraph-element"

import { withProps } from "@udecode/cn"
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE
} from "@udecode/plate-basic-marks"
import {
  createBlockquotePlugin,
  ELEMENT_BLOCKQUOTE
} from "@udecode/plate-block-quote"
import {
  createCodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX
} from "@udecode/plate-code-block"
import {
  createPlugins,
  Plate,
  PlateElement,
  PlateLeaf,
  type RenderAfterEditable
} from "@udecode/plate-common"
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin
} from "@udecode/plate-font"
import {
  createHeadingPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6
} from "@udecode/plate-heading"
import { createLinkPlugin, ELEMENT_LINK } from "@udecode/plate-link"
import {
  createListPlugin,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL
} from "@udecode/plate-list"
import {
  createImagePlugin,
  createMediaEmbedPlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED
} from "@udecode/plate-media"
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH
} from "@udecode/plate-paragraph"
import { createTogglePlugin, ELEMENT_TOGGLE } from "@udecode/plate-toggle"
import { createTrailingBlockPlugin } from "@udecode/plate-trailing-block"

export const plugins = createPlugins(
  [
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable
    }),
    createImagePlugin(),
    createTogglePlugin(),
    createListPlugin(),
    createMediaEmbedPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
    createTrailingBlockPlugin({
      options: { type: ELEMENT_PARAGRAPH }
    })
  ],
  {
    components: {
      [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [ELEMENT_CODE_LINE]: CodeLineElement,
      [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
      [ELEMENT_IMAGE]: ImageElement,
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_H1]: withProps(HeadingElement, { variant: "h1" }),
      [ELEMENT_H2]: withProps(HeadingElement, { variant: "h2" }),
      [ELEMENT_H3]: withProps(HeadingElement, { variant: "h3" }),
      [ELEMENT_H4]: withProps(HeadingElement, { variant: "h4" }),
      [ELEMENT_H5]: withProps(HeadingElement, { variant: "h5" }),
      [ELEMENT_H6]: withProps(HeadingElement, { variant: "h6" }),
      [ELEMENT_UL]: withProps(ListElement, { variant: "ul" }),
      [ELEMENT_OL]: withProps(ListElement, { variant: "ol" }),
      [ELEMENT_LI]: withProps(PlateElement, { as: "li" }),
      [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: "strong" }),
      [MARK_CODE]: CodeLeaf,
      [MARK_ITALIC]: withProps(PlateLeaf, { as: "em" }),
      [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: "s" }),
      [MARK_UNDERLINE]: withProps(PlateLeaf, { as: "u" })
    }
  }
)
