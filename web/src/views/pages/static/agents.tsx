/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="agents" /><div className="box in"><span className="badge hin"><i></i>Agents</span><h1 className="hin" style={{'--d': ".08s"}}>Trouver le bon joueur, <span className="grad">enfin simple.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Au lieu de dépendre des recommandations personnelles ou de vidéos éparpillées sur les réseaux, les agents disposent d'un environnement organisé pour découvrir des profils fiables et bien présentés.</p></div></section>
  </>
);

export const B2 = () => (
  <>
    <section className="sec"><div className="box"><div className="sh rv"><div><small>Recherche</small><h2>Cherche comme tu penses.</h2><p>Filtre par poste, âge, nationalité, pied, expérience, niveau ou championnat. Par exemple : un attaquant de 18 à 22 ans, un milieu défensif au Cameroun, un défenseur central gaucher, un gardien en académie.</p></div></div><div className="callout rv"><h2>Tu représentes des joueurs ?</h2><p>Crée ton profil professionnel et rejoins le réseau dès le lancement.</p><div className="row" style={{marginTop: "24px"}}><Link className="btn y" href="/inscription/">Créer un compte</Link><Link className="btn w" href="/confiance/">Comment on vérifie</Link></div></div></div></section>
  </>
);

