import { useEffect, useRef, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { Field } from "./field";
import { Select, type Option } from "./select";

type PhoneFieldProps = {
  label: string;
  name: string;
  defaultCountry: CountryCode;
  errors?: string[];
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// Every country the library knows, by name, with its calling code.
const countries: readonly Option[] = getCountries()
  .map((country) => ({
    value: country,
    label: `${regionNames.of(country) ?? country} (+${getCountryCallingCode(country)})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// The longest E.164 number is 15 digits; the rest is room for the spaces people type.
const maxTyped = 24;

// Typed as written locally, submitted in E.164, which the API checks and stores.
export function PhoneField({ label, name, defaultCountry, errors }: PhoneFieldProps) {
  const [country, setCountry] = useState<string>(defaultCountry);
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const parsed = parsePhoneNumberFromString(number, country as CountryCode);
  const valid = parsed !== undefined && parsed.isValid();
  const shown = touched && number !== "" && !valid ? ["Not a valid number for that country."] : errors;

  // Marks the input invalid for the browser as well, so Enter cannot submit a number the
  // library rejects. Without it the form posts and the API refuses what we already knew was wrong.
  // An empty field is left to the required message, which says the right thing already.
  useEffect(() => {
    const message = number !== "" && !valid ? "Enter a valid number for the country you picked." : "";

    input.current?.setCustomValidity(message);
  }, [number, valid]);

  return (
    <div className="space-y-4">
      <Select
        label="Country"
        name={`${name}Country`}
        options={countries}
        value={country}
        onValueChange={setCountry}
      />

      <Field
        ref={input}
        label={label}
        name={`${name}Number`}
        type="tel"
        autoComplete="tel-national"
        maxLength={maxTyped}
        required
        placeholder="082 123 4567"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        onBlur={() => setTouched(true)}
        // Pressing Enter on an untouched field is a first look at it too.
        onInvalid={() => setTouched(true)}
        errors={shown}
      />

      <input type="hidden" name={name} value={valid ? parsed.number : number} />
    </div>
  );
}
