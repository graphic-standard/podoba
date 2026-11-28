import { CtaPill, CtaPillAction } from './cta-pill'
export const meta = { category: 'Patterns', description: 'Header actions with an optional secondary create menu.' }
export const brand = () => <CtaPill lead="Create a project" onOpenMenu={() => {}} menuHint="Hold or press Shift+F10 for more options."><CtaPillAction onPress={() => {}}>Create</CtaPillAction></CtaPill>
export const neutral = () => <CtaPill tone="neutral" lead="Add a document" subHeading="Choose an existing document."><CtaPillAction>Add</CtaPillAction></CtaPill>
export const holdFeedback = () => <CtaPill lead="Create a project" holdMs={750} holdFeedback onOpenMenu={() => {}} menuHint="Hold or press Shift+F10 for more options."><CtaPillAction onPress={() => {}}>Create</CtaPillAction></CtaPill>
export const stacked = () => <div className="w-72"><CtaPill lead="Signups" subHeading="Open until the end of March" stacked><CtaPillAction>Add</CtaPillAction></CtaPill></div>
export const disabled =() => <CtaPill tone="disabled" lead="Preparing"><CtaPillAction isDisabled>Continue</CtaPillAction></CtaPill>
