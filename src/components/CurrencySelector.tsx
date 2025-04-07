
import React, { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencies, getActiveCurrency, setActiveCurrency } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

export function CurrencySelector() {
  const [value, setValue] = useState(getActiveCurrency().code);
  const { t } = useLanguage();
  
  // Ensure the component reacts to currency changes
  useEffect(() => {
    setValue(getActiveCurrency().code);
  }, []);

  const handleSelectCurrency = (currentValue: string) => {
    const selectedCurrency = currencies.find(c => c.code === currentValue);
    if (selectedCurrency) {
      setActiveCurrency(selectedCurrency);
      setValue(selectedCurrency.code);
      
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new Event('currency-changed'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value && currencies.find((currency) => currency.code === value)?.name}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]">
        <DropdownMenuRadioGroup value={value} onValueChange={handleSelectCurrency}>
          {currencies.slice(0, 3).map((currency) => (
            <DropdownMenuRadioItem
              key={currency.code}
              value={currency.code}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{currency.name} ({currency.symbol})</span>
              {value === currency.code && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
