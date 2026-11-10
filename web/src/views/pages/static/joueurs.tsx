/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="joueurs" /><div className="box in"><span className="badge hin"><i></i>Explorer les talents</span><h1 className="hin" style={{'--d': ".08s"}}>Trouvez votre <span className="grad">prochain talent.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Explorez des profils, découvrez leurs infos sportives et trouvez les talents qui correspondent à vos besoins : par poste, âge, pays ou niveau.</p></div></section>
  </>
);

export const B2 = () => (
  <>
    <section className="sec"><div className="box"><div className="sh rv"><div><small>Ton profil</small><h2>Tout ce qu'un recruteur veut savoir, au même endroit.</h2><p>Photo, âge, nationalité, ville, postes, pied dominant, taille et poids, club ou académie, parcours, niveau, statistiques et objectifs sportifs.</p></div></div><div className="feat3"><div className="f3 rv" data-tilt=""><small>Étape 1</small><h3>Crée ton profil</h3><p>Télécharge l'app, crée ton compte, complète tes infos sportives.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".08s"}}><small>Étape 2</small><h3>Ajoute tes vidéos</h3><p>Tes meilleures actions, classées par poste. Spora privilégie les vidéos authentiques et récentes.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".16s"}}><small>Étape 3</small><h3>Sois découvert</h3><p>Agents et clubs te trouvent, te contactent, tu réponds depuis la messagerie.</p></div></div><p className="note rv">Spora ne promet pas de carrière professionnelle. C'est un espace de plus pour te présenter, être découvert et entrer en relation avec les acteurs du football.</p></div></section>
  </>
);

