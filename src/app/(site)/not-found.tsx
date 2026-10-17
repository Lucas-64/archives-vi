import { PaginaNaoEncontrada } from "../../components/states/PaginaNaoEncontrada";

// Shown when a route inside the (site) group calls notFound(), e.g. a record lookup that fails
// after the route has started rendering. Keeps the site shell.
export default function SiteNotFound() {
  return <PaginaNaoEncontrada />;
}
