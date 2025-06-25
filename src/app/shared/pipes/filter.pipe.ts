import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fields?: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      if (fields) {
        const fieldList = fields.split(',');
        return fieldList.some(field => {
          const value = this.getNestedProperty(item, field.trim());
          return value && value.toString().toLowerCase().includes(searchText);
        });
      } else {
        return JSON.stringify(item).toLowerCase().includes(searchText);
      }
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
