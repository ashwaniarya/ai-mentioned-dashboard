import { Chip } from "@/components/ui/chip"
import { MentionModelIcon } from "@/components/mention-model-icon"
import { cn } from "@/lib/utils"
import { displayLabelForMentionModel } from "@/lib/helpers/mention-filter-label-helpers"
import {
  mentionModelBrandFromApiValue,
  mentionModelIconTintClassByBrand,
} from "@/lib/mention-model-brand"

/** Solid fill: true white in light; dark uses `--card` so it sits above row chrome. Border + label unchanged. */
const mentionModelChipChromeClassName =
  "!bg-white dark:!bg-card !border-border/60 dark:!border-white/[0.26]"

type MentionModelChipProps = {
  model: string
  className?: string
  title?: string
}

function MentionModelChip({ model, className, title }: MentionModelChipProps) {
  const brand = mentionModelBrandFromApiValue(model)
  const label = displayLabelForMentionModel(model)

  return (
    <Chip
      variant="outline"
      tone="neutral"
      className={cn(mentionModelChipChromeClassName, className)}
      title={title ?? (label !== model ? `${label} (${model})` : label)}
      data-mention-model={model}
      data-model-brand={brand}
    >
      <MentionModelIcon
        brand={brand}
        className={mentionModelIconTintClassByBrand[brand]}
      />
      {label}
    </Chip>
  )
}

export { MentionModelChip }
export {
  mentionModelBrandByApiValue,
  mentionModelBrandFromApiValue,
  type MentionModelBrand,
} from "@/lib/mention-model-brand"
