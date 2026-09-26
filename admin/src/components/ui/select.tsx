"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: string;
}

type ParsedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function parseOptions(children: ReactNode): ParsedOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    if (child.type === "optgroup") {
      return parseOptions(props.children);
    }
    if (child.type !== "option") return [];
    const value =
      props.value != null ? String(props.value) : String(props.children ?? "");
    const label =
      typeof props.children === "string" || typeof props.children === "number"
        ? String(props.children)
        : value;
    return [{ value, label, disabled: Boolean(props.disabled) }];
  });
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      className,
      error,
      id,
      children,
      disabled,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      required,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const options = useMemo(() => parseOptions(children), [children]);
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const listId = `${selectId}-listbox`;
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState(
      defaultValue != null ? String(defaultValue) : "",
    );
    const selected = String(isControlled ? value : uncontrolled);
    const selectedOption = options.find((option) => option.value === selected);
    const placeholder = options.find((option) => option.disabled && !option.value);

    const [open, setOpen] = useState(false);
    const [entered, setEntered] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const nativeRef = useRef<HTMLSelectElement | null>(null);

    const setNativeRef = useCallback(
      (node: HTMLSelectElement | null) => {
        nativeRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const enabledIndexes = useMemo(
      () =>
        options
          .map((option, index) => (!option.disabled ? index : -1))
          .filter((index) => index >= 0),
      [options],
    );

    const updateMenuPosition = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const gap = 4;
      const maxMenu = 240;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(maxMenu, openUp ? spaceAbove : spaceBelow));

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        top: openUp ? undefined : rect.bottom + gap,
        bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
        maxHeight,
        zIndex: 80,
      });
    }, []);

    useLayoutEffect(() => {
      if (!open) return;
      updateMenuPosition();
    }, [open, updateMenuPosition, selected, options.length]);

    useEffect(() => {
      if (!open) {
        setEntered(false);
        return;
      }
      const frame = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
      if (!open) return;

      function onPointerDown(event: MouseEvent | TouchEvent) {
        const target = event.target as Node;
        if (rootRef.current?.contains(target) || listRef.current?.contains(target)) {
          return;
        }
        setOpen(false);
      }

      function onViewportChange() {
        updateMenuPosition();
      }

      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
      window.addEventListener("resize", onViewportChange);
      window.addEventListener("scroll", onViewportChange, true);

      return () => {
        document.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("touchstart", onPointerDown);
        window.removeEventListener("resize", onViewportChange);
        window.removeEventListener("scroll", onViewportChange, true);
      };
    }, [open, updateMenuPosition]);

    function commit(next: string) {
      if (!isControlled) setUncontrolled(next);
      const native = nativeRef.current;
      if (native && native.value !== next) {
        native.value = next;
      }
      onChange?.({
        target: { name: name ?? "", value: next },
        currentTarget: { name: name ?? "", value: next },
      } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
      triggerRef.current?.focus();
    }

    function moveHighlight(direction: 1 | -1) {
      if (enabledIndexes.length === 0) return;
      setHighlighted((current) => {
        const position = enabledIndexes.indexOf(current);
        const nextPos =
          position === -1
            ? direction === 1
              ? 0
              : enabledIndexes.length - 1
            : (position + direction + enabledIndexes.length) % enabledIndexes.length;
        return enabledIndexes[nextPos] ?? enabledIndexes[0];
      });
    }

    function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (disabled) return;
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        if (!open) {
          const selectedIndex = options.findIndex(
            (option) => option.value === selected && !option.disabled,
          );
          setHighlighted(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
          setOpen(true);
          return;
        }
        if (event.key === "ArrowDown") moveHighlight(1);
        if (event.key === "ArrowUp") moveHighlight(-1);
        if (event.key === "Enter" || event.key === " ") {
          const option = options[highlighted];
          if (option && !option.disabled) commit(option.value);
        }
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    }

    const displayLabel = selectedOption?.label || placeholder?.label || "Select";
    const isPlaceholder = !selected || selectedOption?.disabled;

    return (
      <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
        <select
          ref={setNativeRef}
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          value={selected}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
          {...props}
          onChange={onChange}
          onBlur={onBlur}
        >
          {children}
        </select>

        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          onClick={() => {
            if (disabled) return;
            const selectedIndex = options.findIndex(
              (option) => option.value === selected && !option.disabled,
            );
            setHighlighted(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
            setOpen((current) => !current);
          }}
          onKeyDown={handleTriggerKeyDown}
          onBlur={(event) =>
            onBlur?.(event as unknown as React.FocusEvent<HTMLSelectElement>)
          }
          className={cn(
            "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm transition-[border-color,background-color] duration-150",
            "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
            error ? "border-red-400" : "border-gray-300 hover:border-gray-400",
            disabled && "cursor-not-allowed bg-gray-50 text-gray-400",
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              isPlaceholder ? "text-gray-400" : "text-gray-900",
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150 ease-out",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {error ? (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {open && typeof document !== "undefined"
          ? createPortal(
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                style={menuStyle}
                className={cn(
                  "overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg",
                  "origin-top transition-[opacity,transform] duration-150 ease-out",
                  entered
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-1 scale-[0.98] opacity-0",
                )}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === selected;
                  const isActive = index === highlighted;
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      className={cn(
                        "flex cursor-pointer items-center px-3 py-2 text-sm transition-colors duration-100",
                        option.disabled && "cursor-not-allowed text-gray-400",
                        !option.disabled && isActive && "bg-gray-50 text-gray-900",
                        !option.disabled && isSelected && "font-medium text-[#153a75]",
                        !option.disabled && !isActive && "text-gray-700",
                      )}
                      onMouseEnter={() => {
                        if (!option.disabled) setHighlighted(index);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        if (!option.disabled) commit(option.value);
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    </li>
                  );
                })}
              </ul>,
              document.body,
            )
          : null}
      </div>
    );
  },
);

export default Select;
