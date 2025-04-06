
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { currencies, getActiveCurrency, setActiveCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(getActiveCurrency().code);
  const isMobile = useIsMobile();

  // Ensure the component reacts to currency changes
  useEffect(() => {
    setValue(getActiveCurrency().code);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? currencies.find((currency) => currency.code === value)?.name
            : "Select currency..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-full p-0",
        isMobile ? "max-w-[calc(100vw-2rem)]" : ""
      )}>
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {currencies.map((currency) => (
              <CommandItem
                key={currency.code}
                value={currency.code}
                onSelect={(currentValue) => {
                  const selectedCurrency = currencies.find(c => c.code.toLowerCase() === currentValue.toLowerCase());
                  if (selectedCurrency) {
                    setActiveCurrency(selectedCurrency);
                    setValue(currentValue);
                    setOpen(false);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === currency.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {currency.name} ({currency.symbol})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
