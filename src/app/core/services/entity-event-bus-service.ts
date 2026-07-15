import { Service, signal } from '@angular/core'

export type EntityKind = 'member' | 'membership-type'

@Service()
export class EntityEventBusService {
  private versions: Record<EntityKind, ReturnType<typeof signal<number>>> = {
    member: signal(0),
    'membership-type': signal(0),
  }

  version(kind: EntityKind) {
    return this.versions[kind].asReadonly()
  }

  notify(kind: EntityKind) {
    this.versions[kind].update((v) => v + 1)
  }
}
