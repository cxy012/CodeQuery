import { Editor } from "@/components/plate-ui/editor"
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import { TooltipProvider } from "@/components/plate-ui/tooltip"
import { plugins } from "@/lib/plugins"
import { Plate, type PlateEditor } from "@udecode/plate-common"

export function RichTextEditor({
  editorOnChange,
  initialValue,
  isReadOnly,
  editor
}: {
  editorOnChange?: (content: any) => void
  initialValue?: any
  isReadOnly: boolean
  editor?: PlateEditor
}) {
  return (
    <div
      onKeyDown={(e) => {
        e.stopPropagation()
      }}
      className="border shadow rounded-md text-foreground">
      <TooltipProvider>
        <Plate
          editor={editor}
          plugins={plugins}
          value={initialValue}
          onChange={(newValue) => {
            editorOnChange(newValue)
          }}>
          <FixedToolbar>
            <FixedToolbarButtons readOnly={isReadOnly} />
          </FixedToolbar>

          <Editor onReset={initialValue} readOnly={isReadOnly} />
        </Plate>
      </TooltipProvider>
    </div>
  )
}
