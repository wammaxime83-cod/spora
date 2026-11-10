/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="opportunites" /><div className="box in"><span className="badge hin"><i></i>Opportunités</span><h1 className="hin" style={{'--d': ".08s"}}>Les chances du football, <span className="grad">au même endroit.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Détections, journées de recrutement, essais, tournois, programmes de formation : les opportunités authentiques, accessibles même sans gros réseau.</p></div></section>
  </>
);

export const B2 = () => (
  <>
    <section className="sec"><div className="box"><div className="sh rv"><div><small>Où ça commence</small><h2>Le Cameroun d'abord, puis toute l'Afrique.</h2><p>Un joueur d'un pays pourra découvrir des clubs, des agents et des opportunités dans d'autres pays, et à terme en Europe.</p></div></div><div className="wall rv"><span className="cp hot">Cameroun<small>Lancement</small></span><span className="cp">Côte d'Ivoire</span><span className="cp">Sénégal</span><span className="cp">Ghana</span><span className="cp">Nigeria</span><span className="cp">RD Congo</span><span className="cp">Mali</span><span className="cp">Burkina Faso</span><span className="cp">Gabon</span><span className="cp">Maroc</span><span className="cp dim">Et d'autres…</span></div></div></section>
  </>
);

