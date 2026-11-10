/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="inscription" /><div className="box in"><span className="badge hin"><i></i>Rejoindre Spora</span><h1 className="hin" style={{'--d': ".08s"}}>Crée ton profil. <span className="grad">Sois repéré.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Choisis qui tu es : joueur, agent, club ou simple invité. Chaque profil a son propre parcours d'inscription.</p></div></section>
  </>
);

