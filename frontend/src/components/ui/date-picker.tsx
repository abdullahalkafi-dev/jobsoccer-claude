"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { DayPicker } from "react-day-picker"
import { enUS, es, fr } from "date-fns/locale"
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * Language-aware date picker. Value is an ISO `YYYY-MM-DD` string (what the native
 * <input type="date"> produced) and is parsed/formatted in LOCAL time (no timezone shift).
 *
 *   <DatePicker value={field.value} onChange={field.onChange} />
 *   <DatePicker value={watch("dateOfBirth")} onChange={(v) => setValue("dateOfBirth", v, { shouldValidate: true })} toDate={new Date()} />
 */
export interface DatePickerProps {
  /** ISO `YYYY-MM-DD` (a longer ISO datetime is tolerated; only the date part is used). */
  value?: string | Date | null
  /** Called with ISO `YYYY-MM-DD`, or "" when cleared. */
  onChange?: (value: string) => void
  onBlur?: () => void
  /** Earliest / latest selectable date (Date or ISO string). */
  fromDate?: Date | string
  toDate?: Date | string
  disabled?: boolean
  /** Show the clear button (default true). */
  clearable?: boolean
  placeholder?: string
  id?: string
  name?: string
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-label"?: string
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/

/** "YYYY-MM-DD" -> local Date (no timezone shift). Invalid -> undefined. */
export function parseISODate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
  const m = DATE_RE.exec(value)
  if (!m) return undefined
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return undefined
  return date
}

/** local Date -> "YYYY-MM-DD" */
export function toISODate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function toLocalDate(v?: Date | string): Date | undefined {
  if (!v) return undefined
  return typeof v === "string" ? parseISODate(v) : v
}

const dfLocales = { en: enUS, es, fr } as const

function DatePicker({
  value,
  onChange,
  onBlur,
  fromDate,
  toDate,
  disabled,
  clearable = true,
  placeholder,
  id,
  name,
  className,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const t = useTranslations("common.datePicker")
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)

  const selected = parseISODate(value)
  const min = toLocalDate(fromDate)
  const max = toLocalDate(toDate)
  const dfLocale = dfLocales[locale as keyof typeof dfLocales] ?? enUS
  const weekStartsOn = locale === "en" ? 0 : 1

  const today = React.useMemo(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }, [])
  const startMonth = min ?? new Date(1900, 0, 1)
  const endMonth = max ?? new Date(today.getFullYear() + 30, 11, 1)
  const todayDisabled = (!!min && today < min) || (!!max && today > max)

  const initialMonth = () =>
    selected ?? (max && max < today ? max : min && min > today ? min : today)
  const [month, setMonth] = React.useState<Date>(initialMonth)
  React.useEffect(() => {
    if (open) setMonth(initialMonth())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const label = React.useMemo(
    () =>
      selected
        ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(selected)
        : "",
    [selected, locale]
  )

  const commit = (date?: Date) => {
    onChange?.(date ? toISODate(date) : "")
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          name={name}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          data-empty={!selected}
          className={cn(
            "w-full justify-start gap-2 text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 opacity-60" />
          <span className="truncate">{label || placeholder || t("placeholder")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-3">
        <DayPicker
          mode="single"
          locale={dfLocale}
          weekStartsOn={weekStartsOn}
          selected={selected}
          onSelect={(d) => commit(d ?? undefined)}
          month={month}
          onMonthChange={setMonth}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
          labels={{
            labelPrevious: () => t("previousMonth"),
            labelNext: () => t("nextMonth"),
            labelMonthDropdown: () => t("selectMonth"),
            labelYearDropdown: () => t("selectYear"),
          }}
          components={{
            Chevron: ({ orientation, className: c }) =>
              orientation === "left" ? (
                <ChevronLeft className={cn("size-4", c)} />
              ) : orientation === "right" ? (
                <ChevronRight className={cn("size-4", c)} />
              ) : (
                <ChevronDown className={cn("size-3.5", c)} />
              ),
          }}
          classNames={{
            root: "w-fit",
            months: "relative flex flex-col",
            month: "flex flex-col gap-3",
            nav: "absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between",
            button_previous:
              "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none disabled:opacity-40",
            button_next:
              "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none disabled:opacity-40",
            month_caption: "flex h-8 items-center justify-center px-9",
            dropdowns: "flex items-center justify-center gap-1 text-sm font-medium",
            dropdown_root:
              "relative inline-flex items-center rounded-md px-1.5 py-1 hover:bg-accent has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
            dropdown: "absolute inset-0 w-full cursor-pointer opacity-0",
            caption_label: "inline-flex items-center gap-1 text-sm font-medium capitalize",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday: "w-9 text-center text-xs font-normal text-muted-foreground capitalize",
            week: "mt-1 flex w-full",
            day: "relative size-9 p-0 text-center text-sm",
            day_button:
              "inline-flex size-9 items-center justify-center rounded-md text-sm font-normal hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none cursor-pointer",
            selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary",
            today: "[&>button]:border [&>button]:border-primary/50",
            outside: "[&>button]:text-muted-foreground/50",
            disabled: "[&>button]:pointer-events-none [&>button]:opacity-30",
            hidden: "invisible",
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
          <Button type="button" variant="ghost" size="sm" disabled={todayDisabled} onClick={() => commit(today)}>
            {t("today")}
          </Button>
          {clearable && selected && (
            <Button type="button" variant="ghost" size="sm" onClick={() => commit(undefined)}>
              <X />
              {t("clear")}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
