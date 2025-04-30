import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/update/$userId')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/_authenticated/settings/update/$userId"!</div>
}
