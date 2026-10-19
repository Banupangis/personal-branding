import SectionHeading from './SectionHeading';
import { SKILLS } from '../data/content';

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionHeading title="Keterampilan" />
        <div className="details-grid">
          {SKILLS.map((skill) => (
            <article key={skill.title} className="hover-card detail-card">
              <h3>{skill.title}</h3>
              <ul>
                {skill.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
