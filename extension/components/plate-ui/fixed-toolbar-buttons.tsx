import React from 'react';

import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';

import { Icons, iconVariants } from "@/components/icons";

import { InsertDropdownMenu } from './insert-dropdown-menu';
import { MarkToolbarButton } from './mark-toolbar-button';
import { ModeDropdownMenu } from './mode-dropdown-menu';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';
import { ColorDropdownMenu } from "@/components/plate-ui/color-dropdown-menu";
import { MARK_BG_COLOR, MARK_COLOR } from "@udecode/plate-font";

export function FixedToolbarButtons({readOnly}: {readOnly: boolean}) {
  // const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
              <MarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_UNDERLINE} tooltip="Underline (⌘+U)">
                <Icons.underline />
              </MarkToolbarButton>

              <MarkToolbarButton nodeType={MARK_STRIKETHROUGH} tooltip="Strikethrough (⌘+⇧+M)">
                <Icons.strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_CODE} tooltip="Code (⌘+E)">
                <Icons.code />
              </MarkToolbarButton>
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        {/* <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup> */}
      </div>
    </div>
  );
}
