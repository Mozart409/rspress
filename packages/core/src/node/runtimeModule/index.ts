import type { UserConfig } from '@rspress/shared';
import type { BuilderPlugin } from '@modern-js/builder';
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module';
import { RouteService } from '../route/RouteService';
import { PluginDriver } from '../PluginDriver';
import { routeVMPlugin } from './routeData';
import { siteDataVMPlugin } from './siteData';
import { i18nVMPlugin } from './i18n';
import { globalUIComponentsVMPlugin } from './globalUIComponents';
import { globalStylesVMPlugin } from './globalStyles';
import { searchHookVMPlugin } from './searchHooks';
import { prismLanguageVMPlugin } from './prismLanguages';

export interface FactoryContext {
  userDocRoot: string;
  config: UserConfig;
  isSSR: boolean;
  runtimeTempDir: string;
  alias: Record<string, string | string[]>;
  routeService: RouteService;
  pluginDriver: PluginDriver;
}

type RuntimeModuleFactory = (
  context: FactoryContext,
) => Record<string, string> | Promise<Record<string, string>>;

export const runtimeModuleFactory: RuntimeModuleFactory[] = [
  /**
   * Generate route data for client and server runtime
   */
  routeVMPlugin,
  /**
   * Generate search index and site data for client runtime
   */
  siteDataVMPlugin,
  /**
   * Generate global components from config and plugins
   */
  globalUIComponentsVMPlugin,
  /**
   * Generate global styles from config and plugins
   */
  globalStylesVMPlugin,
  /**
   * Generate i18n text for client runtime
   */
  i18nVMPlugin,
  /**
   * Generate search hook module
   */
  searchHookVMPlugin,
  /**
   * Generate prism languages module
   */
  prismLanguageVMPlugin,
];

// We will use this plugin to generate runtime module in browser, which is important to ensure the client have access to some compile-time data
// TODO: We can seperate the compile-time data generation and runtime module generation logic instead of putting them together(such as `siteDataVMPlugin` plugin, it does too much thing) to make it more clear
export function builderDocVMPlugin(
  factoryContext: Omit<FactoryContext, 'alias'>,
): BuilderPlugin {
  const { pluginDriver } = factoryContext;
  return {
    name: 'vmBuilderPlugin',
    setup(api) {
      api.modifyBundlerChain(async bundlerChain => {
        // The order should be sync
        const alias = bundlerChain.resolve.alias.entries();
        const runtimeModule: Record<string, string> = {};
        // Add internal runtime module
        for (const factory of runtimeModuleFactory) {
          const moduleResult = await factory({
            ...factoryContext,
            alias,
          });
          Object.assign(runtimeModule, moduleResult);
        }
        // Add runtime module from outer plugins
        const modulesByPlugin = await pluginDriver.addRuntimeModules();
        Object.keys(modulesByPlugin).forEach(key => {
          if (runtimeModule[key]) {
            throw new Error(
              `The runtime module ${key} is duplicated, please check your plugin`,
            );
          }
          runtimeModule[key] = modulesByPlugin[key];
        });
        bundlerChain
          .plugin(`rspress-runtime-module`)
          .use(
            new RspackVirtualModulePlugin(
              runtimeModule,
              factoryContext.runtimeTempDir,
            ),
          );
      });
    },
  };
}

export enum RuntimeModuleID {
  GlobalStyles = 'virtual-global-styles',
  GlobalComponents = 'virtual-global-components',
  RouteForClient = 'virtual-routes',
  RouteForSSR = 'virtual-routes-ssr',
  SiteData = 'virtual-site-data',
  SearchIndexHash = 'virtual-search-index-hash',
  I18nText = 'virtual-i18n-text',
  SearchHooks = 'virtual-search-hooks',
  PrismLanguages = 'virtual-prism-languages',
}

export const runtimeModuleIDs = [
  RuntimeModuleID.GlobalStyles,
  RuntimeModuleID.GlobalComponents,
  RuntimeModuleID.RouteForClient,
  RuntimeModuleID.RouteForSSR,
  RuntimeModuleID.SiteData,
  RuntimeModuleID.SearchIndexHash,
  RuntimeModuleID.I18nText,
  RuntimeModuleID.SearchHooks,
  RuntimeModuleID.PrismLanguages,
];
