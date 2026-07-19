# Prompts.md — Soup Kitchen Volunteers Registration Form

Documents every AI interaction during this project (ENG-72399)

---

## July 10 - understanding multi-step form pattern in react

Asked claude to explain the general pattern and tradeoffs.

got the idea: keep one piece of state for the current step index, one object for all the form data, and just conditionally render the right fields based on the index. render everything inside one `<form>` so state doesn't get lost switching steps. makes sense once you see it, way simpler than i was expecting - no routing needed, no separate components per step.

---

## July 11 - regex validation

ticket said "write custom regex for validation," which stressed me out a bit since i've always just copy-pasted regex from stackoverflow without really getting it. asked claude to break down how a phone number regex actually works piece by piece instead of just giving me one.

walked through it slowly - `^` and `$` anchor the start/end so partial matches don't sneak through, `\d{3}` means exactly 3 digits, `[\s-]?` means an optional space or dash. once i understood the building blocks i wrote my own patterns for name, email, and zip instead of using whatever it first suggested, and tested them against a bunch of edge cases myself (empty string, only spaces, numbers in the name field, etc.) to make sure they actually failed correctly.

---

## July 12 - why my inputs weren't "controlled" and what that even means

got a warning in the console about a component switching from uncontrolled to controlled and had no idea what it meant. asked claude to explain controlled vs uncontrolled inputs in react since the ticket specifically calls out "ensure controlled components."

turns out i'd initialized one of my state fields as `undefined` instead of an empty string, so react didn't know if it should be tracking the input value or not on the first render. fixed my own initial state object to default everything to `""` or `[]` instead of leaving fields out. also asked why "don't mutate state directly" matters practically - got that mutating an array/object in place won't trigger a re-render since react compares references, not deep values. went back through my own code and fixed a spot where i was doing `data.roles.push(...)` instead of spreading into a new array.

---

## July 13 - simulating bad network conditions without a real backend

this project has no actual backend, so i didn't know how to reasonably fake the "spotty 3G connection" requirement without it feeling fake. asked claude how real apps usually simulate this kind of thing for demos/testing (delay + random failure), since i only knew `setTimeout` for delays and wasn't sure how to add believable failure into it.

used `setTimeout` with a randomized chance of failure to mimic a dropped request, and made sure the error path doesn't wipe out whatever the user already typed - just shows a retry message. wrote the loading spinner and empty-state messaging myself once i understood what states needed to exist (idle / loading / error / empty / success).

---

## July 14 - eslint, accessibility rules, and why they exist

ran the lint script the ticket requires (zero warnings) and got two errors i didn't fully understand at first: `jsx-a11y/label-has-associated-control` and `react/no-unescaped-entities`. asked claude to explain what each rule is actually protecting against rather than just telling me the fix, since i wanted the accessibility score to be real, not just lint-clean.

learned that a `<label>` needs to be tied to an actual form control (via `htmlFor` or wrapping an input) or screen readers can't announce what a grouped set of buttons is for - which is why my "days available" button group needed an `aria-labelledby` span instead of a real `<label>` wrapping non-form elements. fixed both issues myself once i understood why they mattered, then re-ran lint until it came back clean.
