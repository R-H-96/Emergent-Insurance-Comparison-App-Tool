import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";

/**
 * Desktop insurer picker.
 *
 * Replaces the old floating ControlDock rail. Uses the same dialog treatment as
 * the feature detail modal so "change what I'm comparing" and "look at a feature
 * in depth" feel like the same kind of action, rather than the bottom sheet the
 * mobile layout uses.
 */
export default function InsurerPickerDialog({
  open,
  onOpenChange,
  insurers,
  selected,
  onToggle,
  productType,
  onProductType,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[88vh] overflow-y-auto bg-white rounded-[var(--gmc-r-card)] border-[color:var(--gmc-line)] p-0 gap-0"
        data-testid="insurer-picker-dialog"
      >
        <DialogHeader className="p-6 pb-4 border-b" style={{ borderColor: "var(--gmc-line)" }}>
          <DialogTitle
            className="text-2xl gmc-w-heavy tracking-tight text-left"
            style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            What are we comparing?
          </DialogTitle>
          <DialogDescription className="text-sm mt-1 text-left" style={{ color: "var(--gmc-body)" }}>
            Pick two or three insurers. Changes apply straight away.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <ProductTypeSelector value={productType} onChange={onProductType} />
          <InsurerPicker
            insurers={insurers}
            selected={selected}
            onToggle={onToggle}
            compact
          />
        </div>

        <div
          className="p-6 pt-4 border-t flex items-center justify-between gap-4 flex-wrap"
          style={{ borderColor: "var(--gmc-line)", background: "var(--gmc-bg-alt)" }}
        >
          <p className="gmc-t-sm leading-relaxed max-w-md" style={{ color: "var(--gmc-muted)" }}>
            Get My Cover is independent and is not affiliated with or endorsed by any insurer.
          </p>
          <button
            type="button"
            className="gmc-btn-primary gmc-tap"
            onClick={() => onOpenChange(false)}
            data-testid="insurer-dialog-done"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
