import Theme from "./themes";
import { $getRoot, $getSelection } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import {
  InitialEditorStateType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useState } from "react";

function Placeholder() {
  return <div className="editor-placeholder">Mes prises de notes</div>;
}

const editorConfig: any = {
  // The editor theme
  theme: Theme,
  // Handling of errors during update
  onError(error: any) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

export default function RichTextEditor({
  shouldHide,
  id,
  maxWidth = 400,
}: {
  shouldHide: boolean;
  id: string;
  maxWidth?: number;
}) {
  // We keep all the editor states in a map with id of the room as key and editor state
  // as value. The editor state for the current session is editorStates[roomId]
  const [editorStates, setEditorState] = useLocalStorage<Record<string, any>>(
    "tof-editor-state",
    {}
  );
  const [config, setConfig] = useState(() => ({
    ...editorConfig,
    namespace: "tree-of-life-" + id,
  }));

  if (editorStates[id] && !config["editorState"]) {
    // Update the config with the state from local storage if it exists.
    setConfig((prev: any) => ({
      ...prev,
      editorState: JSON.stringify(editorStates[id]),
    }));
  }

  function onChange(editorState: any) {
    //TODO debounce this
    console.log("persisting editor state to local storage");
    setEditorState((prev) => ({ ...prev, [id]: editorState }));
  }

  return (
    <LexicalComposer initialConfig={config}>
      <div
        className="editor-container"
        style={{
          display: shouldHide ? "none" : "block",
          maxWidth: maxWidth,
        }}
      >
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <OnChangePlugin onChange={onChange} />

          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}
