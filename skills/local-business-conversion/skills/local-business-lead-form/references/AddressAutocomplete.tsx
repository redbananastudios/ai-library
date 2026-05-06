"use client";

import { useEffect, useRef } from "react";

// =============================================================================
// AddressAutocomplete
//
// Wraps a regular <input> with Google Places autocomplete. Accepts any UK
// address (street, locality, postcode, etc.) and emits a `Place` payload on
// selection containing both the formatted address and the postcode (when one
// is part of the selected place).
//
// Why classic Autocomplete and not the new PlaceAutocompleteElement: the new
// web-component-based element has a shadow DOM that resists the design-token
// styling we apply to every other form field. The classic Autocomplete API
// attaches a dropdown to a regular <input>, so the input shares all our
// existing field classes and looks identical to its neighbours. The classic
// API is fully supported (Google's deprecation of Sept-2025 was deferred and
// the legacy API remains documented and supported for new keys).
// =============================================================================

type GooglePlacesAutocomplete = {
  addListener: (eventName: "place_changed", handler: () => void) => unknown;
  getPlace: () => {
    formatted_address?: string;
    address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
  };
};

type GooglePlacesNamespace = {
  Autocomplete: new (
    input: HTMLInputElement,
    opts?: Record<string, unknown>,
  ) => GooglePlacesAutocomplete;
};

type GoogleMapsNamespace = {
  places?: GooglePlacesNamespace;
  importLibrary?: (name: string) => Promise<GooglePlacesNamespace>;
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapsNamespace };
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

/** Cached single-script loader. Subsequent calls reuse the same promise so
 *  the script is only injected once even if multiple autocomplete inputs
 *  mount on the same page. */
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-mm-google-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps load failed")));
      return;
    }
    // Legacy loader URL — bundles `places` library inline so window.google.maps.places
    // is populated immediately on script load. The new "loading=async" pattern requires
    // Google's inline bootstrap stub before any script tag and only exposes
    // importLibrary(), which is more boilerplate than this single autocomplete needs.
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.mmGoogleMaps = "true";
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Google Maps load failed")));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export type AutocompletePlace = {
  /** Full Google-formatted address string, e.g. "10 Downing Street, London SW1A 2AA, UK" */
  formattedAddress: string;
  /** Extracted UK postcode if present in the place's address components */
  postcode?: string;
};

type Props = {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelected: (place: AutocompletePlace) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  autoComplete?: string;
};

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelected,
  onFocus,
  placeholder = "Address or postcode",
  className,
  required,
  ariaInvalid,
  autoComplete = "off",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef(onPlaceSelected);
  placeRef.current = onPlaceSelected;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey || !inputRef.current) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const places = window.google?.maps?.places;
        if (!places?.Autocomplete) return;
        const ac = new places.Autocomplete(inputRef.current, {
          // UK-only addresses. `address` type covers street addresses; we add
          // `postal_code` and `(regions)` later by leaving types empty (the
          // default returns the full mix of geocoder types — house numbers,
          // streets, postcodes, towns).
          componentRestrictions: { country: "gb" },
          fields: ["formatted_address", "address_components"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const postcode = place.address_components?.find((c) =>
            c.types.includes("postal_code"),
          )?.long_name;
          placeRef.current({
            formattedAddress: place.formatted_address ?? "",
            postcode,
          });
        });
      })
      .catch((err) => {
        // Loader failure shouldn't break the form — the input still works as
        // a plain text field, validation just falls back to "non-empty".
        console.warn("[AddressAutocomplete] Google Maps load failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      className={className}
      placeholder={placeholder}
      required={required}
      aria-invalid={ariaInvalid}
      autoComplete={autoComplete}
    />
  );
}
