import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { MAX_CHARS } from "../config/editorConfig";

interface EditorProps {
  playKeySound: (key: string) => void;
  saveNote: () => void;
}

export function useEditor({ playKeySound, saveNote }: EditorProps) {
  const [text, setText] = useState("");
  const [pressedKey, setPressedKey] = useState("");
  const [carriageReturn, setCarriageReturn] = useState(0);

  const paperScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoScrollTimerRef = useRef<number | null>(null);
  const keyFlashTimerRef = useRef<number | null>(null);
  const cursorTimerRef = useRef<number | null>(null);

  const restoreCursorSoon = useCallback(
    (textarea: HTMLTextAreaElement, cursorPosition: number) => {
      if (cursorTimerRef.current) {
        window.clearTimeout(cursorTimerRef.current);
      }

      cursorTimerRef.current = window.setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
        cursorTimerRef.current = null;
      }, 0);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        window.clearTimeout(autoScrollTimerRef.current);
      }
      if (keyFlashTimerRef.current) {
        window.clearTimeout(keyFlashTimerRef.current);
      }
      if (cursorTimerRef.current) {
        window.clearTimeout(cursorTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll paper
  const autoScrollPaper = useCallback(() => {
    const el = paperScrollRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) return;
    if (autoScrollTimerRef.current) {
      window.clearTimeout(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = window.setTimeout(() => {
      el.scrollTop = el.scrollHeight;
      autoScrollTimerRef.current = null;
    }, 260); // Delay to allow for carriage return animation
  }, []);

  useEffect(() => {
    autoScrollPaper();
  }, [text, autoScrollPaper]);

  // Adjust textarea height to content
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  // Flash pressed key on virtual keyboard
  const flashKey = useCallback((k: string) => {
    setPressedKey(k);
    if (keyFlashTimerRef.current) {
      window.clearTimeout(keyFlashTimerRef.current);
    }

    keyFlashTimerRef.current = window.setTimeout(() => {
      setPressedKey("");
      keyFlashTimerRef.current = null;
    }, 120);
  }, []);

  // Textarea change handler
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= MAX_CHARS) {
        setText(e.target.value);
      }
    },
    [],
  );

  // Keyboard input handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace") {
        flashKey("Backspace");
        playKeySound("Backspace");
        return;
      }
      if (e.key === "Enter") {
        setCarriageReturn((n) => n + 1);
        flashKey("Enter");
        playKeySound("Enter");
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault(); // Prevent focus change
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newText = text.substring(0, start) + "    " + text.substring(end);

        if (newText.length <= MAX_CHARS) {
          setText(newText);
          // Position cursor after inserted spaces
          restoreCursorSoon(target, start + 4);
        }
        flashKey("Tab");
        playKeySound("Tab");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); // Prevent browser save
        saveNote();
        return;
      }

      // Allow native shortcuts (copy, paste, cut, select all)
      if (
        (e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x"].includes(e.key.toLowerCase())
      ) {
        return; // Let the browser handle it
      }

      // Handle character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        if (text.length < MAX_CHARS) {
          flashKey(e.key.toUpperCase());
          playKeySound(e.key);
        } else {
          e.preventDefault(); // Prevent further input
        }
      }
    },
    [text, flashKey, saveNote, playKeySound, restoreCursorSoon],
  );

  // Screen-key click handler
  const handleKeyClick = useCallback(
    (value: string, type: "char" | "key") => {
      const textarea = inputRef.current;
      if (!textarea) return;

      textarea.focus();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      let newText = text;
      let newCursorPos = start;

      if (type === "char") {
        newText = text.substring(0, start) + value + text.substring(end);
        newCursorPos = start + value.length;
        flashKey(value === " " ? " " : value.toUpperCase());
        playKeySound(value);
      } else {
        if (value === "Backspace") {
          if (start === end && start > 0) {
            newText = text.substring(0, start - 1) + text.substring(end);
            newCursorPos = start - 1;
          } else if (start !== end) {
            newText = text.substring(0, start) + text.substring(end);
            newCursorPos = start;
          }
          flashKey("Backspace");
          playKeySound("Backspace");
        } else if (value === "Enter") {
          newText = text.substring(0, start) + "\n" + text.substring(end);
          newCursorPos = start + 1;
          setCarriageReturn((n) => n + 1);
          flashKey("Enter");
          playKeySound("Enter");
        } else if (value === "Tab") {
          newText = text.substring(0, start) + "    " + text.substring(end);
          newCursorPos = start + 4;
          flashKey("Tab");
          playKeySound("Tab");
        }
      }

      if (newText.length <= MAX_CHARS) {
        setText(newText);
        restoreCursorSoon(textarea, newCursorPos);
      }
    },
    [text, flashKey, playKeySound, restoreCursorSoon],
  );

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  return {
    text,
    setText,
    pressedKey,
    carriageReturn,
    inputRef,
    paperScrollRef,
    handleTextChange,
    handleKeyDown,
    handleKeyClick,
    focusInput,
  };
}
