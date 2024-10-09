import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Chip, Box } from "@mui/material";

const typeOptions = ["name", "size", "type"];
const operatorOptions = [":", "<", ">", "is not", "is"];
const valueOptions = {
  name: ["matias", "john", "sara", "alex"],
  size: ["small", "medium", "large"],
  type: ["pdf", "doc", "image", "video"],
};

const MultiStepAutocomplete = () => {
  const [inputValue, setInputValue] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [stagedFilter, setStagedFilter] = useState<string[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [stage, setStage] = useState<"type" | "operator" | "value">("type");
  const [error, setError] = useState(false); // Track error state
  const [errorMessage, setErrorMessage] = useState(""); // Track error message
  const [open, setOpen] = useState(false); // Control the open state of Autocomplete
  const textFieldRef = useRef<HTMLInputElement>(null); // Ref for TextField focus management

  useEffect(() => {
    setInputValue("");
  }, [stagedFilter]);

  const resetInput = () => {
    setInputValue("");
    setStagedFilter([]);
    setCurrentSuggestions(typeOptions);
    setStage("type");
    setError(false); // Clear error on reset
    setErrorMessage("");
  };

  const handleInputChange = (_: React.SyntheticEvent, newValue: string) => {
    setInputValue(newValue);

    if (stage === "type") {
      const matchedType = typeOptions.filter((option) =>
        option.startsWith(newValue)
      );
      setCurrentSuggestions(matchedType);
    } else if (stage === "operator") {
      const matchedOperator = operatorOptions.filter((option) =>
        option.startsWith(newValue)
      );
      setCurrentSuggestions(matchedOperator);
    } else if (stage === "value" && stagedFilter.length) {
      const lastType = stagedFilter[0];
      const matchedValues = (valueOptions[lastType] || []).filter((option) =>
        option.startsWith(newValue)
      );
      setCurrentSuggestions(matchedValues);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!currentSuggestions.includes(inputValue)) {
        setError(true); // Show error
        setErrorMessage("Invalid selection"); // Set error message
        setInputValue(""); // Clear invalid input
        return;
      }

      setError(false); // Clear error on valid input
      setErrorMessage("");

      if (stage === "type") {
        setStagedFilter([inputValue]);
        setStage("operator");
        setCurrentSuggestions(operatorOptions);
      } else if (stage === "operator") {
        setStagedFilter([...stagedFilter, inputValue]);
        setStage("value");
        const lastType = stagedFilter[0];
        setCurrentSuggestions(valueOptions[lastType] || []);
      } else if (stage === "value") {
        const completedFilter = `${stagedFilter.join(" ")} ${inputValue}`;
        setFilters([...filters, completedFilter]);
        resetInput();
      }

      // Keep the focus on the TextField
      setTimeout(() => {
        textFieldRef.current?.focus();
        setOpen(true); // Reopen the dropdown after focusing
      }, 0);
    }
  };

  const handleAutocompleteChange = (
    _: React.SyntheticEvent,
    newValue: string | null
  ) => {
    if (!newValue || !currentSuggestions.includes(newValue)) {
      setError(true); // Show error
      setErrorMessage("Invalid selection"); // Set error message
      setInputValue(""); // Clear invalid input
      return;
    }

    setError(false); // Clear error on valid input
    setErrorMessage("");

    if (stage === "type") {
      setStagedFilter([newValue]);
      setStage("operator");
      setCurrentSuggestions(operatorOptions);
    } else if (stage === "operator") {
      setStagedFilter([...stagedFilter, newValue]);
      setStage("value");
      const lastType = stagedFilter[0];
      setCurrentSuggestions(valueOptions[lastType] || []);
    } else if (stage === "value") {
      const completedFilter = `${stagedFilter.join(" ")} ${newValue}`;
      setFilters([...filters, completedFilter]);
      resetInput();
    }

    // Keep the focus on the TextField
    setTimeout(() => {
      textFieldRef.current?.focus();
      setOpen(true); // Reopen the dropdown after focusing
    }, 0);
  };

  const getPlaceholder = () => {
    if (stage === "type") return "Add category";
    if (stage === "operator") return "Add operator";
    return "Select value";
  };

  return (
    <Box>
      <Autocomplete
        key={stage}
        freeSolo
        disableClearable
        open={open} // Control open state
        onOpen={() => setOpen(true)} // Open dropdown on focus
        onClose={() => setOpen(false)} // Close dropdown on blur or selection
        options={currentSuggestions}
        inputValue={inputValue}
        onFocus={() => {
          setOpen(true);
          if (stage === "type") setCurrentSuggestions(typeOptions);
          else if (stage === "operator") setCurrentSuggestions(operatorOptions);
          else if (stage === "value" && stagedFilter.length) {
            const lastType = stagedFilter[0];
            setCurrentSuggestions(valueOptions[lastType] || []);
          }
        }}
        onInputChange={handleInputChange}
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={textFieldRef} // Attach ref to TextField for focus
            variant="outlined"
            placeholder={getPlaceholder()}
            onKeyDown={handleKeyDown}
            error={error} // Display error if set
            helperText={error ? errorMessage : ""} // Show error message if there's an error
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {stagedFilter.map((part, index) => (
                    <Chip
                      key={index}
                      label={part}
                      sx={{
                        marginRight: "0.25em",
                        borderRadius: "4px",
                        height: "auto",
                        padding: "2px 8px",
                        fontSize: "0.875rem",
                      }}
                    />
                  ))}
                </>
              ),
            }}
          />
        )}
      />

      {/* Completed Filters */}
      <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
        {filters.map((filter, index) => (
          <Chip
            key={index}
            label={filter}
            sx={{
              borderRadius: "4px",
              height: "auto",
              padding: "2px 8px",
              fontSize: "0.875rem",
            }}
            onDelete={() => {
              setFilters(filters.filter((_, i) => i !== index));
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MultiStepAutocomplete;
