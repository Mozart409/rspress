import { FrontMatterMeta } from '@rspress/shared';
import { Button } from '../Button';
import { renderHtmlOrText } from '../../logic';
import styles from './index.module.scss';

import {
  normalizeHrefInRuntime as normalizeHref,
  normalizeImagePath,
} from '@/runtime';

const DEFAULT_HERO = {
  name: 'modern',
  text: 'modern ssg',
  tagline: 'modern ssg',
  actions: [],
  image: undefined,
};

export function HomeHero({ frontmatter }: { frontmatter: FrontMatterMeta }) {
  const hero = frontmatter?.hero || DEFAULT_HERO;
  const hasImage = hero.image !== undefined;
  const textMaxWidth = hasImage ? 'sm:max-w-xl' : 'sm:max-w-4xl';
  return (
    <div className="m-auto pt-0 px-6 pb-12 sm:pt-10 sm:px-16 md:pt-16 md:px-16 md:pb-16">
      <div
        className={styles.mask}
        style={{
          left: hasImage ? '75%' : '50%',
        }}
      ></div>
      <div className="m-auto flex flex-col md:flex-row max-w-6xl min-h-[50vh]">
        <div className="flex flex-col justify-center text-center max-w-xl sm:max-w-4xl m-auto order-2 md:order-1">
          <h1 className="font-bold text-3xl sm:text-6xl md:text-7xl m-auto sm:m-4 md:m-0 md:pb-3 lg:pb-2 leading-tight z-10">
            <span className={styles.clip} style={{ lineHeight: '1.3' }}>
              {renderHtmlOrText(hero.name)}
            </span>
          </h1>
          {hero.text?.length && (
            <p
              className={`mx-auto md:m-0 text-3xl sm:text-5xl md:text-6xl pb-2 font-bold z-10 ${textMaxWidth}`}
              style={{ lineHeight: '1.2' }}
            >
              {renderHtmlOrText(hero.text)}
            </p>
          )}

          <p
            className={`whitespace-pre-wrap pt-4 m-auto md:m-0 text-sm sm:tex-xl md:text-2xl text-text-2 font-medium z-10 ${textMaxWidth}`}
          >
            {renderHtmlOrText(hero.tagline)}
          </p>
          <div className="flex flex-wrap justify-center gap-3 m--1.5 pt-8 z-10">
            {hero.actions.map(action => (
              <div className="flex flex-shrink-0 p-1" key={action.link}>
                <Button
                  type="a"
                  text={renderHtmlOrText(action.text)}
                  href={normalizeHref(action.link)}
                  theme={action.theme}
                />
              </div>
            ))}
          </div>
        </div>

        {hasImage ? (
          <div className="rspress-home-hero-image md:flex-center m-auto order-1 md:order-2 sm:flex md:none lg:flex">
            <img
              src={normalizeImagePath(hero.image?.src)}
              alt={hero.image?.alt}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
