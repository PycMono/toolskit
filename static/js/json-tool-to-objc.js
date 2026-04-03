'use strict';
// to-objc — Generate Objective-C model classes from JSON

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">类名</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optNonnull" checked>
      <span>NS_ASSUME_NONNULL</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optInit" checked>
      <span>initWithDict</span>
    </label>`;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  const nonnull = document.getElementById('optNonnull')?.checked ?? true;
  const withInit = document.getElementById('optInit')?.checked ?? true;
  const classes = [];

  function objcType(value, key) {
    if (value === null) return 'NSObject *';
    if (typeof value === 'boolean') return 'BOOL';
    if (typeof value === 'number') return Number.isInteger(value) ? 'NSInteger' : 'double';
    if (typeof value === 'string') return 'NSString *';
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        return 'NSArray<' + toPascalCase(key) + ' *> *';
      }
      return 'NSArray *';
    }
    if (typeof value === 'object') return toPascalCase(key) + ' *';
    return 'NSObject *';
  }

  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

    const header = nonnull ? 'NS_ASSUME_NONNULL_BEGIN\n\n' : '';
    const footer = nonnull ? '\nNS_ASSUME_NONNULL_END' : '';

    const properties = Object.entries(obj).map(([k, v]) => {
      const propName = k;
      const type = objcType(v, k);
      const nonatomic = 'nonatomic, ';
      let attrs = nonatomic;
      if (typeof v === 'boolean') attrs += 'assign';
      else if (typeof v === 'number') attrs += Number.isInteger(v) ? 'assign' : 'assign';
      else attrs += 'copy';
      return `@property (nonatomic, ${attrs.includes('assign') ? 'assign' : 'copy'}) ${type}${propName};`;
    }).join('\n');

    let initMethod = '';
    if (withInit) {
      const params = Object.entries(obj).map(([k, v], i) => {
        const type = objcType(v, k);
        const paramLabel = i === 0 ? k : toCamelCase(k);
        return `${paramLabel}:(${type})${k}`;
      }).join(' ');

      const assigns = Object.entries(obj).map(([k]) => {
        return `    self.${k} = ${k};`;
      }).join('\n');

      initMethod = `\n- (instancetype)${params} {\n    self = [super init];\n    if (self) {\n${assigns}\n    }\n    return self;\n}`;

      const dictParams = Object.entries(obj).map(([k, v], i) => {
        return `${i === 0 ? k : toCamelCase(k)}:(NSDictionary *)${k}`;
      }).join(' ');

      const dictAssigns = Object.entries(obj).map(([k, v]) => {
        let cast = '';
        if (typeof v === 'string') cast = ` (NSString *)`;
        else if (typeof v === 'number' && Number.isInteger(v)) cast = ` (NSInteger)`;
        else if (typeof v === 'number') cast = ` (double)`;
        else if (typeof v === 'boolean') cast = ` (BOOL)`;
        return `    self.${k} = dict[@"${k}"]${cast};`;
      }).join('\n');

      initMethod += `\n\n+ (instancetype)modelWithDictionary:(NSDictionary *)dict {\n    ${name} *model = [[${name} alloc] init];\n${dictAssigns}\n    return model;\n}`;
    }

    classes.push(`${header}@interface ${name} : NSObject\n\n${properties}\n${initMethod}\n\n@end\n${footer}`);
  }

  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(classes.reverse().join('\n\n'), 'objc');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Objective-C model 生成完成</span>';
}
