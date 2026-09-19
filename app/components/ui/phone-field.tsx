import { useState } from "react";
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

// Typed as written locally, submitted in E.164, which the API checks and stores.
export function PhoneField({ label, name, defaultCountry, errors }: PhoneFieldProps) {
  const [country, setCountry] = useState<string>(defaultCountry);
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);

  const parsed = parsePhoneNumberFromString(number, country as CountryCode);
  const valid = parsed !== undefined && parsed.isValid();
  const shown = touched && number !== "" && !valid ? ["Not a valid number for that country."] : errors;

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
        label={label}
        name={`${name}Number`}
        type="tel"
        required
        placeholder="082 123 4567"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        onBlur={() => setTouched(true)}
        errors={shown}
      />

      <input type="hidden" name={name} value={valid ? parsed.number : number} />
    </div>
  );
}
