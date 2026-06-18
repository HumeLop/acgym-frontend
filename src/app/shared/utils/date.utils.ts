import { DateTime } from 'luxon'

class DateUtilsImpl {
  private readonly ZONA_MX = 'America/Mexico_City'

  parseDateString(dateString: string): Date | null {
    if (!dateString) return null

    let dateTime: DateTime

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      dateTime = DateTime.fromFormat(dateString, 'yyyy-MM-dd', {
        zone: this.ZONA_MX,
      })
    } else {
      dateTime = DateTime.fromISO(dateString, {
        zone: this.ZONA_MX,
      })
    }

    if (!dateTime.isValid) {
      console.warn(`Fecha inválida: ${dateString}`)
      return null
    }

    return dateTime.toJSDate()
  }

  formatDateForAPI(date: Date | null | undefined): string | null {
    if (!date) return null

    const dateTime = DateTime.fromJSDate(date, { zone: this.ZONA_MX })

    if (!dateTime.isValid) {
      console.warn('Fecha inválida para formatear:', date)
      return null
    }

    return dateTime.toFormat('yyyy-MM-dd')
  }

  formatDateForDisplay(date: Date | null | undefined): string {
    if (!date) return ''

    const dateTime = DateTime.fromJSDate(date, { zone: this.ZONA_MX })

    if (!dateTime.isValid) {
      console.warn('Fecha inválida para mostrar:', date)
      return ''
    }

    return dateTime.setLocale('es-MX').toLocaleString(DateTime.DATE_FULL)
  }

  today(): Date {
    return DateTime.now().setZone(this.ZONA_MX).startOf('day').toJSDate()
  }

  isValidDate(date: Date | null | undefined): boolean {
    if (!date) return false
    return DateTime.fromJSDate(date, { zone: this.ZONA_MX }).isValid
  }

  toDateTime(date: Date | null | undefined): DateTime | null {
    if (!date) return null
    return DateTime.fromJSDate(date, { zone: this.ZONA_MX })
  }

  fromDateTime(dateTime: DateTime): Date {
    return dateTime.setZone(this.ZONA_MX).toJSDate()
  }

  formatForDateInput(date: Date | null | undefined): string {
    if (!date) return ''
    return DateTime.fromJSDate(date, { zone: this.ZONA_MX }).toFormat('yyyy-MM-dd')
  }

  calculateAge(birthDate: Date | null | undefined): number | null {
    if (!birthDate) return null
    const birth = DateTime.fromJSDate(birthDate, { zone: this.ZONA_MX })
    const now = DateTime.now().setZone(this.ZONA_MX)
    return Math.floor(now.diff(birth, 'years').years)
  }

  isPastDate(date: Date | null | undefined): boolean {
    if (!date) return false
    return DateTime.fromJSDate(date, { zone: this.ZONA_MX }) < DateTime.now().setZone(this.ZONA_MX)
  }

  calculateMembershipExpiration(startDate: Date, durationMonths: number): Date {
    return DateTime.fromJSDate(startDate, { zone: this.ZONA_MX })
      .plus({ months: durationMonths })
      .endOf('day')
      .toJSDate()
  }
}

export const DateUtils = new DateUtilsImpl()
