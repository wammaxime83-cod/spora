/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="highlights" /><div className="box in"><span className="badge hin"><i></i>Spora Highlights</span><h1 className="hin" style={{'--d': ".08s"}}>Le talent se voit <span className="grad">en action.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Les buts, les skills, les passes, les arrêts et les meilleures performances des talents présents sur Spora.</p><div className="row hin" style={{'--d': ".24s", marginTop: "26px"}}><Link className="btn" href="/espace/">Publier mon highlight →</Link></div></div></section>
  </>
);

export const B2 = () => (
  <>
    <section className="sec"><div className="box"><div className="callout rv"><h2>Montre ce que tu sais faire.</h2><p>Publie tes meilleures actions et donne aux clubs et aux agents une première impression de ton niveau.</p><div className="row" style={{marginTop: "24px"}}><Link className="btn y" href="/inscription/">Créer mon profil</Link></div></div></div></section>
  </>
);

