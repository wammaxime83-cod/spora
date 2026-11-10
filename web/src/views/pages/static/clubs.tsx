/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="clubs" /><div className="box in"><span className="badge hin"><i></i>Clubs & académies</span><h1 className="hin" style={{'--d': ".08s"}}>Recrutez par poste, <span className="grad">sans perdre de temps.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Les clubs et académies présentent leur structure, consultent des profils, ciblent un poste précis, regardent les vidéos et publient leurs détections.</p></div></section>
  </>
);

export const B2 = () => (
  <>
    <section className="sec"><div className="box"><div className="info3"><div className="f3 rv" data-tilt=""><small>Clubs</small><h3>Une vitrine pour le club</h3><p>Identité, ville, championnat, activités. Consulter les profils, cibler un poste précis, regarder les vidéos.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".08s"}}><small>Académies</small><h3>Valoriser la formation</h3><p>Présenter ses équipes, son environnement et les joueurs accompagnés, et développer son réseau.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".16s"}}><small>Annonces</small><h3>Publier une détection</h3><p>Postes, âge souhaité, lieu, conditions et date, visibles de tous les joueurs concernés.</p></div></div></div></section>
  </>
);

